defmodule SolardocPhoenixWeb.FileJSON do
  alias SolardocPhoenix.Files.File
  alias SolardocPhoenix.Utils

  @doc """
  Renders a list of files.
  """
  def index(%{files: files}) do
    for(file <- files, do: data(file))
  end

  @doc """
  Renders a single file.
  """
  def show(%{file: file}) do
    data(file)
  end

  defp data(%File{} = file) do
    %{
      id: file.id,
      file_name: file.file_name,
      last_edited: Utils.naive_datetime_to_unix_milliseconds(file.last_edited),
      content: file.content,
      created: Utils.naive_datetime_to_unix_milliseconds(file.created),
      owner_id: file.owner_id
    }
  end
end
