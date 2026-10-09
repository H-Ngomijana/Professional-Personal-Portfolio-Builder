import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/project-agreement")({
  head: () => ({
    meta: [
      { title: "Project agreement — Hugues B." },
      {
        name: "description",
        content: "Review the project request and delivery terms before submitting a brief.",
      },
      { property: "og:title", content: "Project agreement — Hugues B." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectAgreement,
});

function ProjectAgreement() {
  return (
    <main className="agreement-page section-container">
      <Link className="order-back" to="/start-project">
        <ArrowLeft aria-hidden="true" />
        Return to your project brief
      </Link>
      <span className="eyebrow">Project request / Terms</span>
      <h1 className="section-title">
        A clear start to
        <br />
        <em>good work.</em>
      </h1>
      <p>
        These terms explain how project requests are handled. Submitting a brief is a request for a
        proposal, not a purchase or a binding commitment to begin work.
      </p>

      <h2>Scope and proposal</h2>
      <p>
        The selected package is a starting point for discussion. Before work begins, the studio will
        confirm the deliverables, exclusions, schedule, and any third-party services required in a
        written proposal.
      </p>

      <h2>Fees and payment</h2>
      <p>
        Prices shown on the site are estimates. A one-time payment preference may qualify for the
        displayed estimate discount; milestone amounts, due dates, taxes, and any additional costs
        will be confirmed in the proposal. No payment is collected by submitting the project brief.
      </p>

      <h2>Delivery and collaboration</h2>
      <p>
        The proposal will describe the expected timeline and review points. The client is
        responsible for providing accurate project information, content, and timely feedback needed
        to complete the agreed work.
      </p>

      <h2>Changes and cancellation</h2>
      <p>
        Requests outside the agreed scope may affect fees and delivery dates and must be approved
        before the additional work starts. Any cancellation, refund, and handover terms will be
        stated in the final written agreement.
      </p>

      <h2>Privacy</h2>
      <p>
        Contact and project details are used to review and respond to the request. They are shared
        only with the studio for that purpose and are not made publicly available.
      </p>

      <p className="agreement-disclaimer">
        The project brief does not create a contract. Work begins only after both parties approve a
        separate written proposal or agreement describing the final scope and terms.
      </p>
    </main>
  );
}
