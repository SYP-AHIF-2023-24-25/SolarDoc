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

    # Auth with 'Phoenix.Token' for API requests and websocket connections
    plug :put_user_token
  end

  defp put_user_token(conn, _) do
    if current_user = conn.assigns[:current_user] do
      token = Phoenix.Token.sign(conn, "user socket", current_user.id)
      assign(conn, :user_token, token)
    else
      conn
    end
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :api_auth do
    plug :fetch_api_user
  end

  # Other scopes may use custom stacks.
  # scope "/api", SolardocPhoenixWeb do
  #   pipe_through :api
  # end

  # Enable LiveDashboard and Swoosh mailbox preview in development
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
  end

  scope "/", SolardocPhoenixWeb do
    pipe_through :api

    # Index page which returns a simple message
    get "/", HomeController, :index

    # User routes
    get "/users", UserController, :index

    # User registration, login, and password reset routes
    post "/users/signup", UserRegistrationController, :create
    post "/users/login", UserSessionController, :create
    post "/users/reset_password", UserResetPasswordController, :create
    put "/users/reset_password/:token", UserResetPasswordController, :update
  end

  scope "/", SolardocPhoenixWeb do
    pipe_through [:api, :api_auth]

    # Get the current user
    get "/users/current", UserController, :current

    # User settings routes
    # TODO! Finish the migration from the old user settings controller to the new API-only controller
    # put "/users/settings", UserSettingsController, :update
    # get "/users/settings/confirm_email/:token", UserSettingsController, :confirm_email
  end

  scope "/", SolardocPhoenixWeb do
    pipe_through :api

    # User routes requiring authentication
    delete "/users/logout", UserSessionController, :delete

    # User confirmation routes
    # TODO! Finish the migration from the old user confirmation controller to the new API-only controller
    # post "/users/confirm", UserConfirmationController, :create
    # post "/users/confirm/:token", UserConfirmationController, :update
  end
end
