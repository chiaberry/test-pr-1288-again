import { useState } from "react";
import { useMutation } from "@apollo/client";
import { DELETE_PROJECT_COMPONENT } from "src/queries/components";

export const useDeleteComponent = () => {
  /* if a component is being deleted */
  const [isDeletingComponent, setIsDeletingComponent] = useState(false);

  const [deleteProjectComponent] = useMutation(DELETE_PROJECT_COMPONENT);

  return {
    isDeletingComponent,
    setIsDeletingComponent,
    deleteProjectComponent,
  };
};
