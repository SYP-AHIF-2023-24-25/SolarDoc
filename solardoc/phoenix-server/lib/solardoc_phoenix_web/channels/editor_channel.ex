defmodule SolardocPhoenixWeb.EditorChannel do
  use SolardocPhoenixWeb, :channel

  alias SolardocPhoenix.Repo
  alias SolardocPhoenix.EditorChannels
  alias SolardocPhoenix.EditorChannels.EditorChannel
  alias SolardocPhoenixWeb.ChangesetJSON
  alias SolardocPhoenixWeb.EditorChannelJSON

  @impl true
  def join("channel:new", %{"data" => data}, socket) do
    data = Map.put(data, "creator_id", socket.assigns.user_id)
    with {:ok, editor_channel} <- EditorChannels.create_channel(data) do
      editor_channel = Repo.preload(editor_channel, :creator)
      send(self(), {:after_create, editor_channel: editor_channel})
      {:ok, socket}
    else
      {:error, changeset} -> {:error, %{
        message: "Failed to create the channel",
        data: data,
        errors: ChangesetJSON.error(%{changeset: changeset})
      }}
    end
  end

  @impl true
  def join("channel:" <> editor_channel_id, %{"auth" => auth}, socket) do
    with %EditorChannel{} = editor_channel <- EditorChannels.get_channel!(editor_channel_id) do
      if authorized?(editor_channel, %{auth: auth}) do
        assign(socket, :editor_channel_id, editor_channel_id)
        send(self(), {:after_join, editor_channel: editor_channel})
        {:ok, socket}
      else
        {:error, %{
          message: "Unauthorized operation"
        }}
      end
    else
      _ -> {:error, %{
        message: "Not found"
      }}
    end
  end

  @impl true
  def join("channel:" <> _editor_channel_id, _params, _socket) do
    {:error, %{
      message: "Unauthorized operation"
    }}
  end

  @impl true
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  @impl true
  def handle_info({:after_create, editor_channel: editor_channel}, socket) do
    broadcast!(
      socket,
      "new_channel",
      %{
        body: "A new channel has been created",
        editor_channel: EditorChannelJSON.show(%{editor_channel: editor_channel}),
        creator_id: socket.assigns.user_id,
        from: "system"
      }
    )
    {:noreply, socket}
  end

  @impl true
  def handle_info({:after_join, editor_channel: editor_channel}, socket) do
    broadcast!(socket, "user_join", %{
      body: "A new user has joined a channel",
      channel_id: editor_channel.id,
      user_id: socket.assigns.user_id,
      from: "system"
    })
    {:noreply, socket}
  end

  @doc """
  Broadcasts the update of the editor content to all clients in the room.
  """
  def handle_in("editor_update", %{"body" => body, "api_url" => api_url}, socket) do
    with true <- is_channel_creator(socket) do
      broadcast!(socket, "editor_update", %{body: body, api_url: api_url})
      {:noreply, socket}
    else
      _ -> {:error, %{
        message: "Unauthorized operation"
      }}
    end
  end

  @impl true
  def handle_in("shout", payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  @impl true
  def terminate(reason, socket) do
    IO.puts("Terminating #{inspect(socket)} because #{inspect(reason)}")
    # TODO! Destroy the editor channel if the creator leaves
    :ok
  end

  @impl true
  def onError(reason, socket) do
    IO.puts("Error in channel: #{inspect(reason)}")
    {:noreply, socket}
  end

  defp authorized?(editor_channel, %{auth: auth}) do
    EditorChannel.valid_password?(editor_channel, auth)
  end

  defp is_channel_creator(socket) do
    socket.assigns.editor_channel_id == socket.assigns.user_id
  end
end
