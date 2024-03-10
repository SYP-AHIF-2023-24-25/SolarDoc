defmodule SolardocPhoenixWeb.UserSocket do
  use Phoenix.Socket

  channel "room:*", SolardocPhoenixWeb.RoomChannel

  @impl true
  def connect(%{"token" => token}, socket, _connect_info) do
    # max_age: 1209600 is equivalent to two weeks in seconds
    # TODO! Needs to be reworked, we're gonna use the user token returned by the API
    case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
      {:ok, user_id} ->
        {:ok, assign(socket, :current_user, user_id)}
      {:error, _reason} ->
        :error
    end
  end

  @impl true
  def id(socket), do: "user_socket:#{socket.assigns.user_id}"
end
