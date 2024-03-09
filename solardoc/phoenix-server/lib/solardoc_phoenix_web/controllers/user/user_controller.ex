defmodule SolardocPhoenixWeb.UserController do
  use SolardocPhoenixWeb, :controller

  alias SolardocPhoenix.Accounts

  action_fallback SolardocPhoenixWeb.FallbackController

  def index(conn, _params) do
    accounts = Accounts.list_accounts()
    render(conn, :index, accounts: accounts)
  end

  def current(conn, _params) do
    user = conn.assigns.current_user
    render(conn, :show_priv, user: user)
  end
end
