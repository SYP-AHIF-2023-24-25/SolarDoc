defmodule SolardocPhoenix.Repo do
  use Ecto.Repo,
    otp_app: :solardoc_phoenix,
    adapter: Ecto.Adapters.Postgres
end
