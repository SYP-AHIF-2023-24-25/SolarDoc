defmodule SolardocPhoenixWeb.UserSocket do
  use Phoenix.Socket

  alias SolardocPhoenixWeb.UserAuth

  channel "channel:*", SolardocPhoenixWeb.EditorChannel

  @impl true
  def connect(%{"token" => token}, socket, _connect_info) do
    # We are simply reusing here the token issued by '/user/auth'
    # to authenticate the user and assign the user_id to the socket
    case UserAuth.fetch_ws_user(token) do
      {:ok, user} ->
        {:ok, assign(socket, :user_id, user.id)}
      {:error, reason} ->
        {:error, reason}
    end
  end

  @impl true
  def id(socket), do: "user_socket:#{socket.assigns.user_id}"
end
