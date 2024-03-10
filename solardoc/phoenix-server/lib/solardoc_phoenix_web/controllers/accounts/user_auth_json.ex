defmodule SolardocPhoenixWeb.UserAuthJSON do
  def create(%{token: token}) do
    %{token: token}
  end

  def delete(%{message: message}) do
    %{message: message}
  end
end
