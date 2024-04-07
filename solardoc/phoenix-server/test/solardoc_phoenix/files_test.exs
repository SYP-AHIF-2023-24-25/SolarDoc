defmodule SolardocPhoenix.FilesTest do
  use SolardocPhoenix.DataCase

  alias SolardocPhoenix.Files

  describe "files" do
    alias SolardocPhoenix.Files.File

    import SolardocPhoenix.FilesFixtures

    @invalid_attrs %{created: nil, file_name: nil, last_edited: nil}

    test "list_files/0 returns all files" do
      file = file_fixture()
      assert Files.list_files() == [file]
    end

    test "get_file!/1 returns the file with given id" do
      file = file_fixture()
      assert Files.get_file!(file.id) == file
    end

    test "create_file/1 with valid data creates a file" do
      valid_attrs = %{created: ~N[2024-03-21 07:35:00], file_name: "some file_name", last_edited: ~N[2024-03-21 07:35:00]}

      assert {:ok, %File{} = file} = Files.create_file(valid_attrs)
      assert file.created == ~N[2024-03-21 07:35:00]
      assert file.file_name == "some file_name"
      assert file.last_edited == ~N[2024-03-21 07:35:00]
    end

    test "create_file/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Files.create_file(@invalid_attrs)
    end

    test "update_file/2 with valid data updates the file" do
      file = file_fixture()
      update_attrs = %{created: ~N[2024-03-22 07:35:00], file_name: "some updated file_name", last_edited: ~N[2024-03-22 07:35:00]}

      assert {:ok, %File{} = file} = Files.update_file(file, update_attrs)
      assert file.created == ~N[2024-03-22 07:35:00]
      assert file.file_name == "some updated file_name"
      assert file.last_edited == ~N[2024-03-22 07:35:00]
    end

    test "update_file/2 with invalid data returns error changeset" do
      file = file_fixture()
      assert {:error, %Ecto.Changeset{}} = Files.update_file(file, @invalid_attrs)
      assert file == Files.get_file!(file.id)
    end

    test "delete_file/1 deletes the file" do
      file = file_fixture()
      assert {:ok, %File{}} = Files.delete_file(file)
      assert_raise Ecto.NoResultsError, fn -> Files.get_file!(file.id) end
    end

    test "change_file/1 returns a file changeset" do
      file = file_fixture()
      assert %Ecto.Changeset{} = Files.change_file(file)
    end
  end
end
