defmodule SolardocPhoenix.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      SolardocPhoenixWeb.Telemetry,
      SolardocPhoenix.Repo,
      {DNSCluster, query: Application.get_env(:solardoc_phoenix, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: SolardocPhoenix.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: SolardocPhoenix.Finch},
      # Start a worker by calling: SolardocPhoenix.Worker.start_link(arg)
      # {SolardocPhoenix.Worker, arg},
      # Start to serve requests, typically the last entry
      SolardocPhoenixWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: SolardocPhoenix.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    SolardocPhoenixWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
