defmodule SolardocPhoenixWeb.EditorChannelState do
  use Agent
  require Logger

  def start_link(_) do
    Logger.info("EditorChannelState starting...")
    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  @doc """
  Get the state for a channel. Returns nil if the channel doesn't exist.

  ## Examples

      iex> get(123)
      "Some text"

      iex> get(456)
      nil
  """
  def get_curr_state(channel_id) do
    # Stack is a nested property of the map, so we need to first get the map by the channel_id and then the state
    Agent.get(__MODULE__, fn state -> (Map.get(state, channel_id, %{}))["state"] end)
  end

  @doc """
  Update the state for a channel. This will create a state if it doesn't exist yet.

  This will overwrite all transformations and create an empty stack.

  ## Examples

      iex> update(123, %{})
      :ok

      iex> update(456, %{})
      :ok
  """
  def force_set_state(channel_id, state) do
    Agent.update(
      __MODULE__,
      fn state -> Map.put(state, channel_id, %{state: state, last_applied_trans: nil, trans_stack: []}) end
    )
  end

  @doc """
  Push a new transformation to the stack of transformations for a channel.
  """
  def push_new_trans(channel_id, trans) do
    # TODO!
  end
end
