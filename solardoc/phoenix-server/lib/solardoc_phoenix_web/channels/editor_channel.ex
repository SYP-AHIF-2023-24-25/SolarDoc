defmodule SolardocPhoenixWeb.EditorChannel do
  @moduledoc false
  use SolardocPhoenixWeb, :channel

  alias SolardocPhoenix.Repo
  alias SolardocPhoenix.EditorChannels
  alias SolardocPhoenix.EditorChannels.EditorChannel
  alias SolardocPhoenix.Files
  alias SolardocPhoenixWeb.ChangesetJSON
  alias SolardocPhoenixWeb.V2.EditorChannelJSON
  alias SolardocPhoenixWeb.EditorChannelState
  alias SolardocPhoenixWeb.EditorChannelTrans
  alias SolardocPhoenix.Utils

  @impl true
  def join("channel:new", %{"data" => data, "state" => state}, socket) do
    case EditorChannels.create_channel(Map.put(data, "creator_id", socket.assigns.user_id)) do
      {:ok, editor_channel} ->
        editor_channel = editor_channel
          |> Repo.preload(:creator)
          |> Repo.preload(:file)
        set_file_channel(editor_channel.file, editor_channel.id)

        # We assume that the user holds the truth about the channel state, so as such we simply load this into the server
        # state. To make sure that the state is in sync with the database (which it should usually be, but potentially
        # there a recent un-synced state), we should load the state into the database as well.
        init_trans = EditorChannelState.init_with_state(editor_channel.id, editor_channel.file_id, state)
        sync_to_db(editor_channel, state)

        send(self(), {:after_create, editor_channel: editor_channel, init_trans: init_trans})
        {:ok, socket}
      {:error, changeset} ->
        {:error, %{
          message: "Failed to create the channel",
          data: data,
          errors: ChangesetJSON.error(%{changeset: changeset}),
        }}
    end
  end

  @impl true
  def join("channel:" <> channel_id, %{"auth" => auth}, socket) do
    with {:exists, %EditorChannel{} = editor_channel} <- {:exists, EditorChannels.get_channel!(channel_id)},
         {:authorised, true} <- {:authorised, authorized?(editor_channel, %{auth: auth})} do
      editor_channel = editor_channel |> Repo.preload(:file)
      state = get_state_or_create(editor_channel.id, editor_channel.file_id, editor_channel.file.content)

      init_trans = EditorChannelState.get_last_trans(channel_id)
      send(self(), {:after_join, editor_channel: editor_channel, state: state, init_trans: init_trans})
      {:ok, socket}
    else
      {:exists, _} -> {:error, %{
        message: "Not found",
      }}
      {:authorised, false} -> {:error, %{
        message: "Unauthorized operation",
      }}
    end
  end

  @impl true
  def join("channel:" <> channel_id, data, _socket) do
    {:error, %{
      message: "Invalid operation",
      topic: "channel:" <> channel_id,
      data: data,
    }}
  end

  @impl true
  def join(topic, data, _socket) do
    {:error, %{
      message: "Unknown topic. No operation possible.",
      topic: topic,
      data: data,
    }}
  end

  @impl true
  def handle_info({:after_create, editor_channel: editor_channel, init_trans: init_trans}, socket) do
    broadcast!(
      socket,
      "new_channel",
      %{
        body: "A new channel has been created",
        editor_channel: V2EditorChannelJSON.show(%{editor_channel: editor_channel}),
        creator_id: socket.assigns.user_id,
        init_trans: init_trans,
      }
    )
    {:noreply, socket}
  end

  @impl true
  def handle_info({:after_join, editor_channel: editor_channel, state: state, init_trans: init_trans}, socket) do
    broadcast!(socket, "user_join", %{
      body: "A new user has joined a channel",
      channel_id: editor_channel.id,
      user_id: socket.assigns.user_id,
      file: %{
        id: editor_channel.file.id,
        file_name: editor_channel.file.file_name,
        last_edited: Utils.naive_datetime_to_unix_milliseconds(editor_channel.file.last_edited),
        owner_id: editor_channel.file.owner_id,
        created: editor_channel.file.created,
        content: state,
      },
      init_trans: init_trans
    })
    {:noreply, socket}
  end

  @impl true
  def handle_info({:process_state_trans, trans: %EditorChannelTrans{} = trans}, socket) do
    IO.puts("Processing transformation received from #{trans.user_id} (#{trans.timestamp})")

    # We will first push the new transformation, applying it to the editor state and then broadcast the same
    # transformation to all other users in the channel
    channel_id = curr_channel_id(socket)
    EditorChannelState.push_new_trans(channel_id, trans)

    # For testing
    content = EditorChannelState.get_text(channel_id)
    IO.puts("[channel:#{channel_id}] Pushed transformation to channel state. New state:\n#{content}")

    # We simply broadcast the transformation itself
    broadcast!(socket, "state_trans", trans)
    {:noreply, socket}
  end

  @impl true
  def handle_in("ping" = _ping, payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  @doc """
  Handles the request for a transformation from the user and will then (eventually) process it and apply it to the state
  of the channel, if it is valid. If it is not valid, an error message will be sent back to the user.
  """
  def handle_in("state_trans" = _state_trans, %{"id" => id, "trans" => trans}, socket) do
    case SolardocPhoenixWeb.EditorChannelTrans.validate_trans(trans) do
      {:ok, processed_trans} ->
        send(self(), {
          :process_state_trans,
          trans: EditorChannelTrans.create(%{"id" => id, "trans" => processed_trans}, socket.assigns.user_id)
        })
        {:noreply, socket}
      {:error, error_message} ->
        {:reply, {:error, %{message: error_message}}, socket}
    end
  end

  @impl true
  def handle_in("shout" = _shout, payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  @impl true
  def terminate(reason, socket) do
    IO.puts("Terminating #{inspect(socket)} because #{inspect(reason)}")
    :ok
  end

  defp get_state_or_create(channel_id, file_id, content) do
    state = EditorChannelState.get_text(channel_id)
    if state != nil do
      state
    else
      init_channel_state_and_get(channel_id, file_id, content)
    end
  end

  defp init_channel_state_and_get(channel_id, file_id, content) do
    EditorChannelState.init_with_state(channel_id, file_id, content)
    content
  end

  defp sync_to_db(editor_channel, state) do
    Files.update_file(editor_channel.file, %{content: state})
  end

  defp curr_channel_id(socket) do
    socket.topic |> String.split(":", trim: true) |> List.last()
  end

  defp authorized?(editor_channel, %{auth: auth}) do
    EditorChannel.valid_password?(editor_channel, auth)
  end

  defp channel_creator?(socket) do
    "channel:" <> channel_id = socket.topic
    case EditorChannels.get_channel!(channel_id) do
      %EditorChannel{} -> true
      _ -> false
    end
  end

  defp set_file_channel(file, channel_id) do
    Files.update_file(file, %{channel_id: channel_id})
  end
end
