defmodule SolardocPhoenixWeb.UserController do
  use SolardocPhoenixWeb, :controller
  use PhoenixSwagger

  alias SolardocPhoenix.Accounts

  action_fallback SolardocPhoenixWeb.FallbackController

  @api_path SolardocPhoenixWeb.v1_api_path()

  def swagger_definitions do
    %{
      UserPublic: swagger_schema do
        title "UserPublic"
        description "A user of the application (public data)"
        properties do
          id :string, "Unique identifier", required: true
        end
      end,
      UserPrivate: swagger_schema do
        title "UserPrivate"
        description "A user of the application (full data)"
        properties do
          id :string, "Unique identifier", required: true
          email :string, "Users email", required: true
          confirmed_at :date, "Date of confirmation", required: false
          role :string, "Users role", required: true
        end
      end,
      UsersPublic: swagger_schema do
        title "UsersPublic"
        description "A collection of Users (public data)"
        type :array
        items Schema.ref(:UserPublic)
      end,
      UsersPrivate: swagger_schema do
        title "UsersPrivate"
        description "A collection of Users (full data)"
        type :array
        items Schema.ref(:UserPrivate)
      end,
      CreateUser: swagger_schema do
        title "CreateUser"
        description "A new user to be created"
        properties do
          email :string, "Users email", required: true
          password :string, "Users password", required: true
        end
      end
    }
  end

  swagger_path :index do
    get "#{@api_path}/users"
    produces "application/json"
    summary "List all users"
    deprecated false
    response 200, "OK", Schema.ref(:UsersPublic)
  end

  def index(conn, _params) do
    accounts = Accounts.list_accounts()
    render(conn, :index, accounts: accounts)
  end

  swagger_path :current do
    get "#{@api_path}/users/current"
    produces "application/json"
    summary "Get the current user"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    response 200, "OK", Schema.ref(:UserPrivate)
  end

  def current(conn, _params) do
    user = conn.assigns.current_user
    render(conn, :show_priv, user: user)
  end

  swagger_path :create do
    post "#{@api_path}/users"
    consumes "application/json"
    produces "application/json"
    summary "Create a new user"
    parameters do
      user :body, Schema.ref(:CreateUser), "user attributes"
    end
    response 201, "Created", Schema.ref(:UserPrivate)
  end

  def create(conn, %{"user" => user_params}) do
    with {:ok, user} <- Accounts.register_user(user_params) do
      {:ok, _} =
        Accounts.deliver_user_confirmation_instructions(
          user,
          &url(~p"/users/confirm/#{&1}")
        )

      # Return a success JSON response
      conn
      |> put_status(:created)
      |> render(:new, user: user)
    end
  end
end