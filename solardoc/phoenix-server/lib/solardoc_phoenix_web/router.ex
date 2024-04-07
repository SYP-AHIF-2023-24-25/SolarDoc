defmodule SolardocPhoenixWeb.Router do
  use SolardocPhoenixWeb, :router

  import SolardocPhoenixWeb.UserAuth

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {SolardocPhoenixWeb.Layouts, :root}
    plug :put_secure_browser_headers
    plug :protect_from_forgery
    plug :fetch_current_user
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug :fetch_api_user
  end

  pipeline :api_auth do
    plug :require_api_user
  end

  # Enable LiveDashboard, Swagger Dashboard and Swoosh mailbox preview in development
  if Application.compile_env(:solardoc_phoenix, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: SolardocPhoenixWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end

    scope "/api/swagger" do
      forward "/", PhoenixSwagger.Plug.SwaggerUI, otp_app: :solardoc_phoenix, swagger_file: "swagger.json"
    end
  end

  # Index page with a simple message
  scope "/", SolardocPhoenixWeb do
    pipe_through :api

    get "/", HomeController, :index
  end

  ########## - v1 API - ##########

  scope "/api/v1/", SolardocPhoenixWeb do
    pipe_through :api

    # Ping route
    get "/ping", PingController, :index

    # User registration and password reset routes
    post "/users", UserController, :create
    post "/users/reset_password", UserResetPasswordController, :create
    put "/users/reset_password/:token", UserResetPasswordController, :update

    # Solardoc Auth API - Bearer token authentication
    post "/auth/bearer", UserAuthController, :create
  end

  # User routes requiring authentication
  # (This may also include routes which actually don't need authentication, but are only accessible to authenticated
  # users to avoid spam or other abuse)
  scope "/api/v1/", SolardocPhoenixWeb do
    pipe_through [:api, :api_auth]

    # Get the current user
    get "/users/current", UserController, :current

    # User routes
    get "/users", UserController, :index

    # User confirmation routes
    # TODO! Finish the migration from the old user confirmation controller to the new API-only controller
    # post "/users/confirm", UserConfirmationController, :create
    # post "/users/confirm/:token", UserConfirmationController, :update

    # User settings routes
    # TODO! Finish the migration from the old user settings controller to the new API-only controller
    # put "/users/settings", UserSettingsController, :update
    # get "/users/settings/confirm_email/:token", UserSettingsController, :confirm_email

    # Channel routes
    resources "/editor_channels", EditorChannelController, only: [:index, :show, :update]

    # Solardoc Auth API - Logging out i.e. deleting the user bearer token
    delete "/auth/bearer", UserAuthController, :delete

    # Share URL routes
    resources "/share_urls", ShareURLController, only: [:index, :show, :create, :update, :delete]
  end

  ########## - General API Info - ##########

  def swagger_info do
    %{
      basePath: "/api",
      schemes: ["http", "https", "ws", "wss"],
      info: %{
        version: SolardocPhoenixWeb.version(),
        title: "@solardoc/phoenix",
        description: "The Solardoc Phoenix Rest API and SDS (Solardoc Socket)",
        license: %{
          name: "GNU General Public License v3.0",
          url: "https://github.com/SYP-AHIF-2023-24-25/SolarDoc/blob/main/LICENSE",
        },
        contact: %{
          name: "Luna Klatzer, Emma Walchshofer & Lisa Pichler",
        }
      },
      securityDefinitions: %{
        Bearer: %{
          type: "apiKey",
          name: "Authorization",
          in: "header",
          description: "API Token must be provided via `Authorization: Bearer ` header",
        }
      },
      consumes: ["application/json"],
      produces: ["application/json"],
      tags: [
        %{name: "User", description: "User resources"},
        %{name: "UserAuth", description: "User authentication resources"},
        %{name: "UserConfirmation", description: "User confirmation resources"},
        %{name: "UserSettings", description: "User settings resources"},
      ]
    }
  end
end
