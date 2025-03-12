defmodule SolardocPhoenixWeb.UTF16Comp do
  @moduledoc false

  import Bitwise

  @doc """
  Inserts into a UTF-16 string at a given position. The input is going to be a standard UTF-8 string, but the internal
  representation is UTF-16. This means that the position is going to be in terms of UTF-16 code units, not UTF-8 code
  units.

  ## Parameters
    * `state` - The current state of the string.
    * `pos` - The position to insert at.
    * `content` - The content to insert.

  ## Returns
    * `String` - The new state of the string

  """
  def insert(state, pos, content) do
    utf16_state = get_utf16_code_units_from_str(state)
    utf16_content = get_utf16_code_units_from_str(content)

    # Insert the content into the state
    {utf16_before, utf16_after} = Enum.split(utf16_state, pos)
    utf16_result = utf16_before ++ utf16_content ++ utf16_after

    get_str_from_utf16_code_units(utf16_result)
  end

  @doc """
  Deletes from a UTF-16 string at a given position removing n characters moving backwards from pos. The input is going
  to be a standard UTF-8 string, but the internal representation is UTF-16. This means that the position is going to be
  in terms of UTF-16 code units, not UTF-8 code units.

  ## Parameters
    * `state` - The current state of the string.
    * `pos` - The position to delete from.
    * `length` - The length of the content to delete.

  ## Returns
    * `String` - The new state of the string
  """
  def delete(state, pos, length) do
    utf16_state = get_utf16_code_units_from_str(state)

    # Delete the content from the state
    {utf16_before, utf16_after} = Enum.split(utf16_state, pos)
    utf16_result = Enum.drop(utf16_before, -length) ++ utf16_after

    get_str_from_utf16_code_units(utf16_result)
  end

  @doc """
  Splits a UTF-16 string into a list of UTF-16 code units. The input is going to be a standard UTF-8 string, but the
  internal representation is UTF-16.

  ## Parameters
    * `utf8_str` - The UTF-8 string to split into UTF-16 code units.

  ## Returns
    * `List` - The list of UTF-16 code units.
  """
  def get_utf16_code_units_from_str(utf8_str) do
    get_utf16_code_points_from_str(utf8_str)
    |> split_utf16_code_points_into_code_units()
  end

  @doc """
  Converts a UTF-8 string into a list of UTF-16 code points. The input is going to be a standard UTF-8 string, but the
  internal representation is UTF-16.

  ## Parameters
    * `utf8_str` - The UTF-8 string to convert into UTF-16 code points.

  ## Returns
    * `List` - The list of UTF-16 code points.
  """
  def get_utf16_code_points_from_str(utf8_str) do
    :unicode.characters_to_binary(utf8_str, :utf8, {:utf16, :little})
    |> :unicode.characters_to_list({:utf16, :little})
  end

  @doc """
  Splits a list of UTF-16 code points into a list of UTF-16 code units. This is necessary because the systems needs to
  work on code units and not allow merged code points (surrogates) and handle them as single code units.

  ## Parameters
    * `utf16_code_points` - The list of UTF-16 code points to split into UTF-16 code units.

  ## Returns
    * `List` - The list of UTF-16 code units.
  """
  def split_utf16_code_points_into_code_units(utf16_code_points) do
    # Split the list of UTF-16 code points into a list of UTF-16 code units, this is necessary because the systems needs
    # to work on code units and not allow merged code points (surrogates) and handle them as single code units.
    # Going to simply split any code point that is greater than 0xFFFF into their two code units.
    utf16_code_points
    |> Enum.map(&split_utf16_code_point_into_code_units/1)
    |> List.flatten()
  end

  @doc """
  Splits a UTF-16 code point into one or two UTF-16 code units. This is necessary because the systems needs to work on
  code units and not allow merged code points (surrogates) and handle them as single code units.

  ## Parameters
    * `utf16_code_point` - The UTF-16 code point to split into UTF-16 code units.

  ## Returns
    * `List` - The list of one or two UTF-16 code units.
  """
  def split_utf16_code_point_into_code_units(utf16_code_point) do
    # Split the UTF-16 code point into two code units
    if utf16_code_point <= 0xFFFF do
      [utf16_code_point]
    else
      utf16_code_point = utf16_code_point - 0x10000
      [
        0xD800 + (utf16_code_point >>> 10),
        0xDC00 + (utf16_code_point &&& 0x3FF)
      ]
    end
  end

  @doc """
  Converts a list of UTF-16 code units into a UTF-8 string. The input is going to be a list of UTF-16 code units, which
  are then converted into a UTF-8 string to be used by the system.

  ## Parameters
    * `utf16_code_units` - The list of UTF-16 code units to convert into a UTF-8 string.

  ## Returns
    * `String` - The UTF-8 string.
  """
  def get_str_from_utf16_code_units(utf16_code_units) do
    # Convert the list of UTF-16 code units to a UTF-8 string
    utf16_code_units
    |> merge_utf16_code_units_into_code_points()
    |> :unicode.characters_to_binary({:utf16, :little}, :utf8)
  end

  @doc """
  Merges all lose UTF-16 code units into UTF-16 code points. This is necessary to work as a reverse operation to
  `split_utf16_code_points_into_code_units/1` and allow the system to work with the proper UTF-16 code points.

  The algorithm is as follows:

  1. Go through every code unit and see whether it is a regular code unit or a potential high surrogate. If it is a high
     surrogate, we need to wait for the next code unit to be a low surrogate to merge them into a single code point.
  2. If the item is a low surrogate, and the previous item was a high surrogate, we merge them into a single code point.
     If the previous item was not a high surrogate, we treat it as a lone surrogate and append it to the list of code
     points.
  3. If the item is not a surrogate, we treat it as a regular code point and append it to the list of code points. If
     the previous item was a high surrogate, we treat it as a lone surrogate and append it to the list of code points
     before the current code point.

  See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#utf-16_characters_unicode_code_points_and_grapheme_clusters
  for more information, as we rely on the same rules as JavaScript to ensure compatibility.

  ## Parameters
    * `utf16_code_units` - The list of UTF-16 code units to merge into UTF-16 code points.

  ## Returns
    * `List` - The list of UTF-16 code points.
  """
  def merge_utf16_code_units_into_code_points(utf16_code_units) do
    utf16_code_units
    |> Enum.reduce({[], nil}, fn
      code_unit, {code_points, nil} when code_unit in 0xD800..0xDBFF ->
        {code_points, code_unit}
      code_unit, {code_points, high_surrogate} when code_unit in 0xDC00..0xDFFF ->
        code_point = 0x10000 + ((high_surrogate - 0xD800) <<< 10) + (code_unit - 0xDC00)
        {code_points ++ [code_point], nil}
      code_unit, {code_points, maybe_high_surrogate} ->
        new_code_points = if maybe_high_surrogate, do: code_points ++ [maybe_high_surrogate], else: code_points
        {new_code_points ++ [code_unit], nil}
      end)
    |> elem(0) # Get the code points from the tuple
  end
end