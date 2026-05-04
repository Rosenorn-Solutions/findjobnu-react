import { describe, it, expect } from "vitest";
import JobList from "../../components/JobList";
import { renderWithProviders, screen } from "../../test/testUtils";

describe("JobList", () => {
  it("renders image URLs in banner and footer", () => {
    const bannerUrl = "https://cdn.example.com/banner.jpg";
    const footerUrl = "https://cdn.example.com/footer.png";
    const job = {
      id: 1,
      title: "Frontend Developer",
      bannerImageUrl: bannerUrl,
      footerImageUrl: footerUrl,
      description: "Kort beskrivelse",
      company: "ACME",
      location: "København",
      postedDate: new Date("2024-01-01"),
      jobUrl: "https://example.com",
    };

    renderWithProviders(
      <JobList
        jobs={[job]}
        loading={false}
        currentPage={1}
        pageSize={10}
        totalCount={1}
        onPageChange={() => {}}
      />,
      {
        userContext: {
          user: { userId: "user-1", accessToken: "token" },
        },
      }
    );

    const banner = screen.getByAltText("Banner for jobopslag");
    const footer = screen.getByAltText("Footer grafik for jobopslag");

    expect(banner).toHaveAttribute("src", bannerUrl);
    expect(footer).toHaveAttribute("src", footerUrl);
  });

  it("renders category name from categories array", () => {
    const job = {
      id: 2,
      title: "Fullstack Developer",
      description: "Beskrivelse",
      company: "Tech Corp",
      location: "Aarhus",
      postedDate: new Date("2024-02-01"),
      categories: [{ id: 1, categoryName: "Engineering" }],
    };

    renderWithProviders(
      <JobList
        jobs={[job]}
        loading={false}
        currentPage={1}
        pageSize={10}
        totalCount={1}
        onPageChange={() => {}}
      />,
      {
        userContext: {
          user: { userId: "user-1", accessToken: "token" },
        },
      }
    );

    expect(screen.getByText("Engineering")).toBeInTheDocument();
  });
});
