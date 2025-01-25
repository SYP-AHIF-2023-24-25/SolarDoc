defmodule SolardocPhoenixWeb.V2.UserAuthController do
  use SolardocPhoenixWeb, :controller
  use PhoenixSwagger, except: [:delete]

  alias SolardocPhoenix.Accounts
  alias SolardocPhoenixWeb.UserAuth
  alias SolardocPhoenixWeb.CommonParameters

  action_fallback SolardocPhoenixWeb.FallbackController

  @api_path SolardocPhoenixWeb.v2_api_path()

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
      ErrorResp: swagger_schema do
        title "ErrorsResp"
        description "A list of errors"
        properties do end
      end
    }
  end

  swagger_path :create do
    post "#{@api_path}/auth/bearer"
    produces "application/json"
    summary "Log in a user"
    deprecated false
    parameters do
      user :body, Schema.ref(:UserLogin), "Arguments for a login", required: true
    end
    response 201, "Created", Schema.ref(:UserToken)
    response 400, "Bad Request", Schema.ref(:ErrorResp)
    response 401, "Unauthorized", Schema.ref(:ErrorResp)
  end

  def create(conn, user_params) do
    with {:valid_args, %{"email" => email, "password" => password}} <- {:valid_args, user_params},
      {:ok, user} <- Accounts.get_user_by_email_and_password(email, password) do
      {token, expires_at} = UserAuth.create_user_token(user)
      conn
      |> put_status(:created)
      |> render(:create, %{token: token, expires_at: expires_at})
    else
      {:valid_args, _} -> {:error, :bad_request}
      {:error, :unauthorized} -> {:error, :unauthorized}
    end
  end

  swagger_path :delete do
    PhoenixSwagger.Path.delete "#{@api_path}/auth/bearer"
    summary "Log out a user"
    deprecated false
    CommonParameters.auth_bearer
    response 204, "No Content"
    response 400, "Bad Request", Schema.ref(:ErrorResp)
    response 401, "Unauthorized", Schema.ref(:ErrorResp)
  end

  def delete(conn, _params) do
    user = conn.assigns.current_user
    UserAuth.delete_user_api_token(user) # API Logout
    send_resp(conn, :no_content, "")
  end
end
