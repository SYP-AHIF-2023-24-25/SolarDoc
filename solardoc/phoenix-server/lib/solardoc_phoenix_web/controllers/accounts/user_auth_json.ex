defmodule SolardocPhoenixWeb.UserAuthJSON do
  def create(%{token: token, expiration_date: expiration_date}) do
    %{token: token, expiration_date: expiration_date}
  end

  def delete(%{message: message}) do
    %{message: message}
  end
end
