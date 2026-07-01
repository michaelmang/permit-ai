import { Suspense } from "react";
import ConsentApp from "./ConsentApp";

export default function Page() {
  return (
    <div className="wrap">
      <Suspense fallback={null}>
        <ConsentApp />
      </Suspense>
    </div>
  );
}
