import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CityResponse } from "../../findjobnu-api/models";
import SearchForm from "../../components/SearchForm";
import { renderWithProviders, screen, waitFor } from "../../test/testUtils";

const mockCitiesApi = vi.hoisted(() => ({
  getAllCities: vi.fn(),
  getCitiesByQuery: vi.fn(),
}));

vi.mock("../../helpers/ApiFactory", async () => {
  const actual = await vi.importActual<typeof import("../../helpers/ApiFactory")>("../../helpers/ApiFactory");
  return {
    ...actual,
    createApiClient: vi.fn(() => mockCitiesApi),
  };
});

describe("SearchForm suggestions", () => {
  beforeEach(() => {
    mockCitiesApi.getAllCities.mockResolvedValue([
      { id: 1, name: "Aalborg" } as CityResponse,
      { id: 2, name: "Aarhus" } as CityResponse,
    ]);
    mockCitiesApi.getCitiesByQuery.mockResolvedValue([
      { id: 3, name: "Aarhus" } as CityResponse,
      { id: 4, name: "Aabenraa" } as CityResponse,
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads initial city suggestions on focus", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <SearchForm onSearch={vi.fn()} categories={[]} />
    );

    const locationInput = screen.getByLabelText("Lokation");
    await user.click(locationInput);
    await waitFor(() => expect(mockCitiesApi.getAllCities).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole("button", { name: "Vælg Aalborg" })).toBeInTheDocument();
  });

  it("filters cities and supports keyboard selection", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <SearchForm onSearch={vi.fn()} categories={[]} />
    );

    const locationInput = screen.getByLabelText("Lokation");
    await user.type(locationInput, "Aa");

    await waitFor(() => expect(mockCitiesApi.getCitiesByQuery).toHaveBeenCalledWith({ query: "Aa" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Vælg Aarhus" })).toBeInTheDocument());

    await user.keyboard("{ArrowDown}{Enter}");

    // After selecting, the input should be cleared and a chip added
    await waitFor(() => expect(locationInput).toHaveValue(""));
  });

  it("filters categories and accepts keyboard navigation", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <SearchForm
        onSearch={vi.fn()}
        categories={[
          { id: 3, name: "Engineering", numberOfJobs: 3 },
          { id: 2, name: "Marketing", numberOfJobs: 2 },
          { id: 1, name: "Customer Success", numberOfJobs: 1 }
        ]}
      />
    );

    const categoryInput = screen.getByLabelText("Kategori");
    await user.type(categoryInput, "Mar");

    await waitFor(() => expect(screen.queryByRole("button", { name: "Vælg kategori Engineering (3)" })).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole("button", { name: "Vælg kategori Marketing (2)" })).toBeInTheDocument());

    await user.keyboard("{ArrowDown}{Enter}");

    // After selecting, the input should be cleared and a chip added
    expect(categoryInput).toHaveValue("");
  });
});
