defmodule SolardocPhoenixWeb.PingController do
  use SolardocPhoenixWeb, :controller
  use PhoenixSwagger

  action_fallback SolardocPhoenixWeb.FallbackController

  @api_path SolardocPhoenixWeb.v1_api_path()

  def swagger_definitions do
    %{
      Ping: swagger_schema do
        title "Ping"
        description "A simple ping response"
        properties do
          greeting :string, "A friendly greeting", example: "Hello from Solardoc Phoenix!", required: true
          date :integer, "The current date in milliseconds", example: :os.system_time(:millisecond), required: true
          url :string, "The URL to ping", example: "#{@api_path}/ping", required: true
          ip :string, "The IP address of the client", example: "123.98.21.101", required: true
        end
      end
    }
  end

  swagger_path :index do
    get "#{@api_path}/ping"
    produces "application/json"
    summary "Ping the server"
    deprecated false
    response 200, "OK", Schema.ref(:Ping)
  end

  def index(conn, _params) do
    # Return static JSON for now
    json(conn, %{
      greeting: "Hello from Solardoc Phoenix!",
      date: :os.system_time(:millisecond),
      url: "#{@api_path}/ping",
      ip: ip_to_str(conn.remote_ip)
    })
  end

  defp ip_to_str({ip1, ip2, ip3, ip4}) do
    ipv4_to_str({ip1, ip2, ip3, ip4})
  end

  defp ip_to_str({ip1, ip2, ip3, ip4, ip5, ip6, ip7, ip8}) do
    ipv6_to_str({ip1, ip2, ip3, ip4, ip5, ip6, ip7, ip8})
  end

  defp ipv4_to_str({ip1, ip2, ip3, ip4}) do
    "#{ip1}.#{ip2}.#{ip3}.#{ip4}"
  end

  defp ipv6_to_str({ip1, ip2, ip3, ip4, ip5, ip6, ip7, ip8}) do
    {ip1, ip2, ip3, ip4, ip5, ip6, ip7, ip8} = {
      Integer.to_string(ip1, 16),
      Integer.to_string(ip2, 16),
      Integer.to_string(ip3, 16),
      Integer.to_string(ip4, 16),
      Integer.to_string(ip5, 16),
      Integer.to_string(ip6, 16),
      Integer.to_string(ip7, 16),
      Integer.to_string(ip8, 16)
    }
    "#{ip1}:#{ip2}:#{ip3}:#{ip4}:#{ip5}:#{ip6}:#{ip7}:#{ip8}"
  end
end
