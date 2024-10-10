defmodule SolardocPhoenixWeb.Endpoint do
  @moduledoc false
  use Phoenix.Endpoint, otp_app: :solardoc_phoenix

  # The session will be stored in the cookie and signed,
  # this means its contents can be read but not tampered with.
  # Set :encryption_salt if you would also like to encrypt it.
  @session_options [
    store: :cookie,
    key: "_solardoc_phoenix_key",
    signing_salt: "Kn5OzD52",
    same_site: "Lax"
  ]

  # Serve socket at "/sds" (can be then accessed by the client through "ws://<DOMAIN>:4000/sd/websocket")
  socket "/phx/sds", SolardocPhoenixWeb.UserSocket,
    websocket: [
      error_handler: {SolardocPhoenixWeb.UserSocket, :handle_error, []}
    ],
    longpoll: false

  # Serve live server with longpolling at "/live"
  socket "/live", Phoenix.LiveView.Socket,
     websocket: [connect_info: [session: @session_options]]

  # The session will be stored in the cookie and signed,
  # this means its contents can be read but not tampered with.
  # Set :encryption_salt if you would also like to encrypt it.
  @session_options [
    store: :cookie,
    key: "_solardoc_phoenix_key",
    signing_salt: "Kn5OzD52",
    same_site: "Lax"
  ]

  # Serve at "/" the static files from "priv/static" directory.
  #
  # You should set gzip to true if you are running phx.digest
  # when deploying your static files in production.
  plug Plug.Static,
    at: "/phx",
    from: :solardoc_phoenix,
    gzip: false,
    only: SolardocPhoenixWeb.static_paths()

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    socket "/phoenix/live_reload/socket", Phoenix.LiveReloader.Socket
    plug Phoenix.LiveReloader
    plug Phoenix.CodeReloader
    plug Phoenix.Ecto.CheckRepoStatus, otp_app: :solardoc_phoenix
  end

  plug Phoenix.LiveDashboard.RequestLogger,
    param_key: "request_logger",
    cookie_key: "request_logger"

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head

  # CORS
  plug Corsica,
    origins: "*",
    allow_methods: ~w[GET POST PUT PATCH DELETE],
    allow_headers: ~w[Authorization Content-Type],
    max_age: 86_400

  plug Plug.Session, @session_options
  plug SolardocPhoenixWeb.Router
end
