defmodule SolardocPhoenixWeb.EditorChannelTrans do
  defstruct trans_id: nil, trans: nil, timestamp: nil, user_id: nil

  @doc """
  Validate a transformation object. A transformation object should have the following structure:
  - For insert transformations:

    %{
      type: "insert",
      pos: 0,
      content: "Some text"
    }

  - For delete transformations:

    %{
      type: "delete",
      pos: 0,
      length: 1
    }

  If the transformation object is valid, it will return

      {:ok, validated_transformation_object}

  """
  def validate_trans(%{type: type, pos: pos, content: content} = trans) when type == "insert" do
    if is_binary(content) and is_integer(pos) do
      {:ok, %{type: type, content: content, pos: pos}}
    else
      {:error, "Invalid content or position for insert transformation"}
    end
  end

  def validate_trans(%{type: type, pos: pos, length: length} = trans) when type == "delete" do
    if Map.has_key?(trans, :content) do
      {:error, "Delete transformation should not have content"}
    else
      if is_integer(pos) and is_integer(length) do
        {:ok, %{type: type, pos: pos, length: length}}
      else
        {:error, "Invalid position for delete transformation"}
      end
    end
  end

  def validate_trans(_) do
    {:error, "Invalid transformation object scheme"}
  end
end
