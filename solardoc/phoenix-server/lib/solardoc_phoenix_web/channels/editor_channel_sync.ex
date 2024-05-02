defmodule SolardocPhoenixWeb.EditorChannelSync do
  @moduledoc false
  use GenServer
  require Logger

  alias SolardocPhoenix.Files

  def start_link(_) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  @impl true
  def init(init_arg) do
    {:ok, init_arg}
  end

  @impl true
  def handle_info({:sync_db, file_id: file_id, content: content}, state) do
    sync_to_db(state, file_id, content)
    {:noreply, state}
  end

  defp sync_to_db(state, file_id, content) do
    file = Files.get_file!(file_id)
    Files.change_content(file, %{content: content})
    Map.put(state, :timer_ref, nil)
  end
end
