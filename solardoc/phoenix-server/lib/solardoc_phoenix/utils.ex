defmodule SolardocPhoenix.Utils do
  @moduledoc """
  This module contains utility functions for the SolardocPhoenix application.
  """
  @moduledoc since: "0.6.0-dev"

  @doc """
  Converts a naive datetime to UNIX timestamp in milliseconds.

  Examples:

    iex> Utils.naive_datetime_to_unix_milliseconds(~N[2021-01-01 00:00:00])
    1609459200000

    iex> Utils.naive_datetime_to_unix_milliseconds("2021-01-01 00:00:00")
    nil

  ## Parameters

    * `naive_datetime` - A NaiveDateTime struct to convert to UNIX timestamp in milliseconds.

  ## Returns

    * `integer` - The UNIX timestamp in milliseconds.
    * `nil` - If the input is not a NaiveDateTime struct.
  """
  def naive_datetime_to_unix_milliseconds(%NaiveDateTime{} = naive_datetime) do
    naive_datetime
    |> DateTime.from_naive!("Etc/UTC")
    |> DateTime.to_unix(:millisecond)
  end

  def naive_datetime_to_unix_milliseconds(_) do
    nil
  end
end
