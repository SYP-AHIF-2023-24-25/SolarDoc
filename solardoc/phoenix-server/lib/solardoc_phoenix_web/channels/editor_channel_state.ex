defmodule SolardocPhoenixWeb.EditorChannelState do
  use Agent
  require Logger

  # We are going to store for every channel the current state that is "true" for the server

  def start_link(_) do
    Logger.info("EditorChannelState starting...")
    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  @doc """
  Get the state for a channel

  ## Examples

      iex> get(123)
      %{}

      iex> get(456)
      nil
  """
  def get(channel_id) do
    Agent.get(__MODULE__, fn state -> Map.get(state, channel_id) end)
  end

  @doc """
  Update the state for a channel. This will create a state if it doesn't exist yet.

  ## Examples

      iex> update(123, %{})
      :ok

      iex> update(456, %{})
      :ok
  """
  def update(channel_id, val) do
    Agent.update(__MODULE__, fn state -> Map.put(state, channel_id, val) end)
  end

  @doc """
  Update the state for a channel and return the new state. This will create a state if it doesn't exist yet.

  ## Examples

      iex> update_and_get(123, %{})
      %{}

      iex> update_and_get(456, %{})
      %{}
  """
  def update_and_get(channel_id, val) do
    update(channel_id, val)
    get(channel_id)
  end
end
