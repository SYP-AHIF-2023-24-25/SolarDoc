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
    Agent.get(__MODULE__, fn state -> (Map.get(state, channel_id, %{}))["text_state"] end)
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
  def force_set_state(channel_id, text_state) do
    Agent.update(
      __MODULE__,
      fn state -> Map.put(state, channel_id, %{text_state: text_state, last_applied_trans: nil, trans_stack: []}) end
    )
  end

  @doc """
  Push a new transformation to the stack of transformations for a channel.
  """
  def push_new_trans(channel_id, %{} = trans) do
    Agent.update(__MODULE__, fn state ->
      # Push the new transformation to the stack of transformations for the channel
      channel_state = Map.get(state, channel_id, %{})
      trans_stack = Map.get(channel_state, :trans_stack, [])
      updated_trans_stack = [new_trans | trans_stack]
      updated_channel_state = Map.put(channel_state, :trans_stack, updated_trans_stack)

      # Apply the transformation on the state string
      state_string = Map.get(channel_state, :text_state, "")
      new_state_string = case trans.type do
        "insert" -> String.insert(state_string, trans.pos, trans.content)
        "delete" -> String.slice(state_string, 0, trans.pos) <> String.slice(state_string, trans.pos + trans.length)
      end

      updated_channel_state = Map.put(updated_channel_state, :text_state, new_state_string)
      Map.put(state, channel_id, updated_channel_state)
    end)
  end
end
