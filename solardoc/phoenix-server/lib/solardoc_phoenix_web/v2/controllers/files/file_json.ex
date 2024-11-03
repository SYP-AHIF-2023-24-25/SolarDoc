defmodule SolardocPhoenixWeb.V2.FileJSON do
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
      owner_id: file.owner_id,
      channel_id: file.channel_id
    }
  end

  @doc """
  Renders a list of global files.
  """
  def global(%{files: files}) do
    for(file <- files, do: global_data(file))
  end

  defp global_data(file) do
    %{
      id: file.id,
      file_name: file.file_name,
      last_edited: Utils.naive_datetime_to_unix_milliseconds(file.last_edited),
      created: Utils.naive_datetime_to_unix_milliseconds(file.created),
      owner_id: file.owner_id,
      owner_name: file.owner.username,
      channel_id: file.channel_id,
      organisation: file.owner.organisation # Additional property from search_global_files/1
    }
  end
end
