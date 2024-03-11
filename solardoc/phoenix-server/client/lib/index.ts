/**
 * The Solardoc Socket Client (SDS) is a Phoenix Channels client that connects to the Solardoc Phoenix server. It is
 * used to communicate with the server over websockets
 * @since 0.4.0
 */

// Bring in Phoenix channels client library:
import {Socket} from "phoenix"

type PhoenixSocket = Socket

/**
 * Creates a new Socket instance and attempts to connect to the server. If the user token is not passed in, it will
 * attempt to use the global {@link window.userToken} variable. If that is also not set, it will throw an error.
 * @param url The URL of the server to connect to
 * @param userToken The user token to use for authentication. If not passed in, it will attempt to use the global
 * {@link window.userToken} variable.
 * @returns A new Phoenix Socket instance with an active connection to the server
 * @since 0.4.0
 */
function socket(
  url: string,
  userToken?: string
): PhoenixSocket {
    let socket: PhoenixSocket

    // Fall back to the global userToken if it's not passed in
    if (!userToken) {
        userToken = window.userToken
    }

    if (!userToken) {
        console.error("[SDS] 'window.userToken' is undefined or empty, user is probably logged out. Will not connect to socket.")
        throw new Error("Cannot connect to socket without a user token")
    } else {
        // And connect to the path in "lib/solardoc_phoenix_web/endpoint.ex". We pass the
        // token for authentication. Read below how it should be used.
        socket = new Socket(url, {params: {token: userToken}})

        // When you connect, you'll often need to authenticate the client.
        // For example, imagine you have an authentication plug, `MyAuth`,
        // which authenticates the session and assigns a `:current_user`.
        // If the current user exists you can assign the user's token in
        // the connection for use in the layout.
        //
        // In your "lib/solardoc_phoenix_web/router.ex":
        //
        //     pipeline :browser do
        //       ...
        //       plug MyAuth
        //       plug :put_user_token
        //     end
        //
        //     defp put_user_token(conn, _) do
        //       if current_user = conn.assigns[:current_user] do
        //         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
        //         assign(conn, :user_token, token)
        //       else
        //         conn
        //       end
        //     end
        //
        // Now you need to pass this token to JavaScript. You can do so
        // inside a script tag in "lib/solardoc_phoenix_web/templates/layout/app.html.heex":
        //
        //     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
        //
        // You will need to verify the user token in the "connect/3" function
        // in "lib/solardoc_phoenix_web/channels/user_socket.ex":
        //
        //     def connect(%{"token" => token}, socket, _connect_info) do
        //       # max_age: 1209600 is equivalent to two weeks in seconds
        //       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1_209_600) do
        //         {:ok, user_id} ->
        //           {:ok, assign(socket, :user, user_id)}
        //
        //         {:error, reason} ->
        //           :error
        //       end
        //     end
        //
        // Finally, connect to the socket:
        socket.connect()
    }

    return socket
}

export default socket
