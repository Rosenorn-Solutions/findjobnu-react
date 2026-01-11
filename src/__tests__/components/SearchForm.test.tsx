import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";
import SearchForm from "../../components/SearchForm";
import { renderWithProviders, screen } from "../../test/testUtils";

describe("SearchForm", () => {
  it("submits the entered values", async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <SearchForm
        onSearch={onSearch}
        categories={[{ id: 3, name: "Engineering", numberOfJobs: 3 }, { id: 2, name: "Marketing", numberOfJobs: 2 }]}
      />
    );

    // Type into the chip input with aria-label
    await user.type(screen.getByLabelText("Søgeord"), "Frontend,");

    await user.click(screen.getByRole("button", { name: /søg/i }));

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        searchTerms: ["Frontend"],
        locations: undefined,
        categoryIds: undefined,
        postedAfter: undefined,
        postedBefore: undefined,
      })
    );
  });
});
