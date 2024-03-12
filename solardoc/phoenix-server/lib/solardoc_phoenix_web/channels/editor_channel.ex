defmodule SolardocPhoenixWeb.EditorChannel do
  use SolardocPhoenixWeb, :channel

  alias SolardocPhoenix.EditorChannels

  @impl true
  def join("channel:" <> editor_channel_id, %{"auth" => auth}, socket) do
    with {:ok, editor_channel} <- EditorChannels.get_channel!(editor_channel_id) do
      assign(socket, :private_room_id, editor_channel_id)
      if authorized?(editor_channel, %{auth: auth}) do
        {:ok, socket}
      else
        {:error, :unauthorized}
      end
    else
      _ -> {:error, :not_found}
    end
  end

  @impl true
  def join("channel:" <> _editor_channel_id, _params, _socket) do
    {:error, :unauthorized}
  end

  @impl true
  def join("channel:new", %{"data" => data}, socket) do
    with {:ok, editor_channel } <- EditorChannels.create_channel(data) do
      broadcast!(socket, "new_channel", %{editor_channel: editor_channel.id})
      {:ok, socket}
    else
      _ -> {:error, :bad_request}
    end
  end

  @impl true
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  @doc """
  Broadcasts the update of the editor content to all clients in the room.
  """
  def handle_in("update", %{"body" => body}, socket) do
    broadcast!(socket, "new_msg", %{body: body})
    {:noreply, socket}
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

  defp authorized?(editor_channel, %{auth: auth}) do
    Channel.valid_password?(editor_channel, auth)
  end
end
