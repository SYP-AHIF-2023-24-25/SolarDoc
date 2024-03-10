defmodule SolardocPhoenixWeb.UserAuthController do
  use SolardocPhoenixWeb, :controller
  use PhoenixSwagger, except: [:delete]

  alias SolardocPhoenix.Accounts
  alias SolardocPhoenixWeb.UserAuth

  action_fallback SolardocPhoenixWeb.FallbackController

  @api_path SolardocPhoenixWeb.v1_api_path()

  def swagger_definitions do
    %{
      UserLogin: swagger_schema do
        title "UserLogin"
        description "A user login"
        properties do
          email :string, "Users email", required: true
          password :string, "Users password", required: true
        end
      end,
      UserToken: swagger_schema do
        title "UserToken"
        description "A user token"
        properties do
          token :string, "Users token", required: true
        end
      end
    }
  end

  swagger_path :create do
    post "#{@api_path}/users/auth"
    produces "application/json"
    summary "Log in a user"
    deprecated false
    parameters do
      user :body, Schema.ref(:UserLogin), "user login attributes"
    end
    response 200, "OK", Schema.ref(:UserToken)
  end

  def create(conn, %{"user" => user_params}) do
    %{"email" => email, "password" => password} = user_params

    with {:ok, user} <- Accounts.get_user_by_email_and_password(email, password) do
      token = UserAuth.create_user_token(user)
      render(conn, :create, token: token)
    end
  end

  swagger_path :delete do
    PhoenixSwagger.Path.delete "#{@api_path}/users/auth"
    produces "application/json"
    summary "Log out a user"
    deprecated false
  end

  def delete(conn, _params) do
    conn
    |> UserAuth.delete_user_token() # API Logout
    |> render(:delete, message: "Successfully logged out.")
  end
end
