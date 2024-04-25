defmodule SolardocPhoenixWeb.CommonParameters do
  @moduledoc false

  alias PhoenixSwagger.Path.PathObject
  import PhoenixSwagger.Path

  def auth_bearer(path = %PathObject{}) do
    path |> parameter("Authorization", :header, :string, "Bearer", required: true)
  end
end
