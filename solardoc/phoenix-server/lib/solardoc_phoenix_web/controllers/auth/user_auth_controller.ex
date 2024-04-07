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
          expires_at :integer, "Token expiration date in milliseconds", required: true
        end
      end,
      Message: swagger_schema do
        title "Message"
        description "A message"
        properties do
          message :string, "A message", required: true
        end
      end,
      Error: swagger_schema do
        title "Error"
        description "An error"
        properties do
          detail :string, "Error message", required: true
        end
      end,
      Errors: swagger_schema do
        title "Errors"
        description "A list of errors"
        type :array
        items Schema.ref(:Error)
      end
    }
  end

  swagger_path :create do
    post "#{@api_path}/auth/bearer"
    produces "application/json"
    summary "Log in a user"
    deprecated false
    parameters do
      user :body, Schema.ref(:UserLogin), "user login attributes"
    end
    response 200, "OK", Schema.ref(:UserToken)
    response 400, "Bad Request", Schema.ref(:Errors)
    response 401, "Unauthorized", Schema.ref(:Errors)
  end

  def create(conn, user_params) do
    %{"email" => email, "password" => password} = user_params

    with {:ok, user} <- Accounts.get_user_by_email_and_password(email, password) do
      {token, expires_at} = UserAuth.create_user_token(user)
      conn
      |> put_status(:created)
      |> render(:create, %{token: token, expires_at: expires_at})
    end
  end

  swagger_path :delete do
    PhoenixSwagger.Path.delete "#{@api_path}/auth/bearer"
    produces "application/json"
    summary "Log out a user"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    response 200, "OK", Schema.ref(:Message)
    response 400, "Bad Request", Schema.ref(:Errors)
    response 401, "Unauthorized", Schema.ref(:Errors)
  end

  def delete(conn, _params) do
    user = conn.assigns.current_user
    UserAuth.delete_user_api_token(user) # API Logout
    render(conn, :delete, message: "Successfully logged out.")
  end
end
