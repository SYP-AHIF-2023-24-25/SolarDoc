defmodule SolardocPhoenixWeb.EditorChannelState do
  use Agent
  require Logger

  # We are going to store for every channel the current state that is "true" for the server

  def start_link(_) do
    Logger.info("EditorChannelState starting...")
    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  def get(channel_id) do
    Agent.get(__MODULE__, fn state -> Map.get(state, channel_id) end)
  end

  def update(channel_id, val) do
    Agent.update(__MODULE__, fn state -> Map.put(state, channel_id, val) end)
  end

  def update_and_get(channel_id, val) do
    update(channel_id, val)
    get(channel_id)
  end
end
