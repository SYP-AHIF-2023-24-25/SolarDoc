defmodule SolardocPhoenixWeb.FallbackController do
  use Phoenix.Controller

  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(400)
    |> put_view(json: SolardocPhoenixWeb.ChangesetJSON)
    |> render(:error, changeset: changeset)
  end

  def call(conn, {:error, :bad_request}) do
    conn
    |> put_status(400)
    |> put_view(json: SolardocPhoenixWeb.ErrorJSON)
    |> render(:"400")
  end

  def call(conn, {:error, :unauthorized}) do
    conn
    |> put_status(401)
    |> put_view(json: SolardocPhoenixWeb.ErrorJSON)
    |> render(:"401")
  end

  def call(conn, {:error, :forbidden}) do
    conn
    |> put_status(403)
    |> put_view(json: SolardocPhoenixWeb.ErrorJSON)
    |> render(:"403")
  end

  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> put_view(json: SolardocPhoenixWeb.ErrorJSON)
    |> render(:"404")
  end
end
