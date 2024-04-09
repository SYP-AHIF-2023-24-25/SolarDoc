defmodule SolardocPhoenixWeb.EditorChannel do
  use SolardocPhoenixWeb, :channel

  alias Ecto.UUID
  alias SolardocPhoenix.Repo
  alias SolardocPhoenix.EditorChannels
  alias SolardocPhoenix.EditorChannels.EditorChannel
  alias SolardocPhoenix.Files
  alias SolardocPhoenixWeb.ChangesetJSON
  alias SolardocPhoenixWeb.EditorChannelJSON
  alias SolardocPhoenixWeb.EditorChannelState
  alias SolardocPhoenixWeb.EditorChannelTrans

  @impl true
  def join("channel:new", %{"data" => data, "state" => state}, socket) do
    with {:ok, editor_channel} <- EditorChannels.create_channel(Map.put(data, "creator_id", socket.assigns.user_id)) do
      editor_channel = editor_channel
        |> Repo.preload(:creator)
        |> Repo.preload(:file)

      # We assume that the user holds the truth about the channel state, so as such we simply load this into the server
      # state. To make sure that the state is in sync with the database (which it should usually be, but potentially
      # there a recent un-synced state), we should load the state into the database as well.
      EditorChannelState.force_set_state(editor_channel.id, state)
      Files.change_content(editor_channel.file, %{content: state})

      send(self(), {:after_create, editor_channel: editor_channel, state: state})
      {:ok, socket}
    else
      {:error, changeset} -> {:error, %{
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
      state = EditorChannelState.get_curr_state(channel_id)
      if state == nil do
        editor_channel = editor_channel |> Repo.preload(:file)

        state = editor_channel.file.content
        EditorChannelState.force_set_state(channel_id, state)
      end

      send(self(), {:after_join, editor_channel: editor_channel, state: state})
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
  def join("channel:" <> _channel_id, data, _socket) do
    {:error, %{
      message: "Invalid operation",
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
  def handle_info({:after_create, editor_channel: editor_channel, state: state}, socket) do
    IO.puts(EditorChannelState.get_curr_state(editor_channel.id))
    broadcast!(
      socket,
      "new_channel",
      %{
        body: "A new channel has been created",
        editor_channel: EditorChannelJSON.show(%{editor_channel: editor_channel}),
        creator_id: socket.assigns.user_id,
        state: state,
      }
    )
    {:noreply, socket}
  end

  @impl true
  def handle_info({:after_join, editor_channel: editor_channel, state: state}, socket) do
    IO.puts(EditorChannelState.get_curr_state(editor_channel.id))
    broadcast!(socket, "user_join", %{
      body: "A new user has joined a channel",
      channel_id: editor_channel.id,
      user_id: socket.assigns.user_id,
      state: state
    })
    {:noreply, socket}
  end

  @impl true
  def handle_info({:process_state_trans, %EditorChannelTrans{} = trans}, socket) do
    IO.puts("Processing transformation received from #{trans.user_id} (#{trans.timestamp})")

    # We will first push the new transformation, applying it to the editor state and then broadcast the same
    # transformation to all other users in the channel
    EditorChannelState.push_new_trans(curr_channel_id(socket), trans.trans)

    # We simply broadcast the transformation itself
    broadcast!(socket, "state_trans", trans)
  end

  @impl true
  def handle_in(_ping = "ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  @doc """
  Handles the request for a transformation from the user and will then (eventually) process it and apply it to the state
  of the channel, if it is valid. If it is not valid, an error message will be sent back to the user.
  """
  def handle_in(_state_trans = "state_trans", %{"trans" => trans, "timestamp" => timestamp}, socket) do
    case SolardocPhoenixWeb.EditorChannelTrans.validate_trans(trans) do
      {:ok, p_trans} ->
        send(self(), {
          :process_state_trans,
          trans: %EditorChannelTrans{
            trans_id: gen_state_uuid(),
            trans: p_trans,
            timestamp: DateTime.from_unix!(timestamp, :millisecond) |> DateTime.to_naive(),
            user_id: socket.assigns.user_id
          }
        })
        {:noreply, socket}
      {:error, error_message} ->
        {:reply, {:error, %{message: error_message}}, socket}
    end
  end

  @impl true
  def handle_in(_shout = "shout", payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  @impl true
  def terminate(reason, socket) do
    IO.puts("Terminating #{inspect(socket)} because #{inspect(reason)}")
    :ok
  end

  def onError(reason, socket) do
    IO.puts("Error in channel: #{inspect(reason)}")
    {:noreply, socket}
  end

  defp curr_channel_id(socket) do
    socket.topic |> String.split(":", trim: true) |> List.last()
  end

  defp gen_state_uuid() do
    UUID.generate()
  end

  defp authorized?(editor_channel, %{auth: auth}) do
    EditorChannel.valid_password?(editor_channel, auth)
  end

  defp is_channel_creator(socket) do
    "channel:" <> channel_id = socket.topic
    with %EditorChannel{} <- EditorChannels.get_channel!(channel_id) do
      true
    else
      _ -> false
    end
  end
end
