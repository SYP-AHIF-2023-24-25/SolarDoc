defmodule SolardocPhoenixWeb.V2HomeController do
  use SolardocPhoenixWeb, :controller

  action_fallback SolardocPhoenixWeb.FallbackController

  def index(conn, _params) do
    # Return static JSON for now
    json(conn, %{
      version: SolardocPhoenixWeb.version(),
      title: "SolarDoc",
      description: "Welcome to the Phoenix API for Solardoc!"
    })
  end
end
