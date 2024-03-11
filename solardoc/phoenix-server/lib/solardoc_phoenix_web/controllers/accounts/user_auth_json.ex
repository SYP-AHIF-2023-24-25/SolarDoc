defmodule SolardocPhoenixWeb.UserAuthJSON do
  def create(%{token: token, expires_at: expires_at}) do
    %{token: token, expires_at: expires_at}
  end

  def delete(%{message: message}) do
    %{message: message}
  end
end
