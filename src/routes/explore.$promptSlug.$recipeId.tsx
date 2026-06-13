import { createFileRoute, Navigate } from "@tanstack/react-router";

/** Spec-aligned alias: /explore/[promptId]/[recipeId] → /viewer/[recipeId] */
export const Route = createFileRoute("/explore/$promptSlug/$recipeId")({
  component: () => {
    const { recipeId } = Route.useParams();
    return <Navigate to="/viewer/$id" params={{ id: recipeId }} replace />;
  },
});
