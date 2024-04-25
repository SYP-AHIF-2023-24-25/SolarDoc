defmodule SolardocPhoenixWeb.EditorChannelState do
  use Agent
  require Logger

  alias SolardocPhoenixWeb.EditorChannelTrans

  @db_sync_delay 5_000
  @sync_module_name SolardocPhoenixWeb.EditorChannelSync

  def start_link(_) do
    Logger.info("EditorChannelState starting...")
    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  @doc """
  Get the state for a channel. Returns nil if the channel doesn't exist.

  ## Examples

      iex> get_text("123")
      "Some text"

      iex> get_text("456")
      nil
  """
  def get_text(channel_id) do
    # Stack is a nested property of the map, so we need to first get the map by the channel_id and then the state
    Agent.get(__MODULE__, fn state ->
      editor_state = Map.get(state, channel_id, %{})
      Map.get(editor_state, :text_state)
    end)
  end

  @doc """
  Get the last transformation applied to the channel. Returns nil if the channel doesn't exist.

  ## Examples

      iex> get_init_trans("123")
      %{"type" => "insert", "pos" => 0, "content" => "Some text"}

      iex> get_init_trans("456")
      nil
  """
  def get_last_trans(channel_id) do
    Agent.get(__MODULE__, fn state ->
      editor_state = Map.get(state, channel_id, %{})
      List.last(Map.get(editor_state, :trans_stack, []))
    end)
  end

  @doc """
  Initialises a channel state using a base state/content, which will serve as the base transformation.

  ## Returns

    * `EditorChannelTrans` - The created transformation.
  """
  def init_with_state(channel_id, file_id, state) do
    reset_state(channel_id, file_id)
    trans = EditorChannelTrans.create(
      %{"trans" => %{type: "insert", pos: 0, content: state}},
      nil
    )
    push_new_trans(channel_id, trans)
    trans
  end

  defp schedule_db_sync(state, channel_id) do
    editor_state = Map.get(state, channel_id, %{})

    timer_ref = editor_state[:timer_ref]
    if timer_ref do
      Process.cancel_timer(timer_ref)
    end

    file_id = editor_state[:file_id]
    content = editor_state[:text_state]
    timer_ref = Process.send_after(
      @sync_module_name,
      {:sync_db, file_id: file_id, content: content},
      @db_sync_delay
    )
    editor_state = Map.put(editor_state, :timer_ref, timer_ref)

    # Update the state with the new timer reference and return the updated state
    Map.put(state, channel_id, editor_state)
  end

  defp reset_state(channel_id, file_id) do
    Agent.update(
      __MODULE__,
      fn state -> Map.put(state, channel_id, %{
        file_id: file_id,
        channel_id: channel_id,
        text_state: "",
        trans_stack: [],
        timer_ref: nil,
      }) end
    )
  end

  @doc """
  Push a new transformation to the stack of transformations for a channel.
  """
  def push_new_trans(channel_id, %EditorChannelTrans{} = trans) do
    Agent.update(__MODULE__, fn state ->
      raw_trans = trans.trans

      # Push the new transformation to the stack of transformations for the channel
      channel_state = Map.get(state, channel_id, %{})
      trans_stack = Map.get(channel_state, :trans_stack, [])
      updated_trans_stack = [trans | trans_stack]
      updated_channel_state = Map.put(channel_state, :trans_stack, updated_trans_stack)

      # Apply the transformation on the state string
      state_string = Map.get(channel_state, :text_state, "")
      new_state_string = apply_trans_to_str(state_string, raw_trans)

      updated_channel_state = Map.put(updated_channel_state, :text_state, new_state_string)
      state = Map.put(state, channel_id, updated_channel_state)

      # Schedule a sync to the database (returns the updated state)
      schedule_db_sync(state, channel_id)
    end)
  end

  defp apply_trans_to_str(state_string, %{type: "insert", content: content, pos: pos}) do
    String.slice(state_string, 0, pos) <> content <> String.slice(state_string, pos..-1//1)
  end

  defp apply_trans_to_str(state_string, %{type: "delete", length: length, pos: pos}) do
    String.slice(state_string, 0, pos - length) <> String.slice(state_string, pos..-1//1)
  end
end
