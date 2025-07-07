import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "cookie_consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-white p-4 shadow">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700">
          Huurly gebruikt cookies om de gebruikerservaring te verbeteren. Lees ons{" "}
          <Link to="/privacybeleid" className="underline">
            privacybeleid
          </Link>
          .
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={decline}>
            Weigeren
          </Button>
          <Button onClick={accept}>Accepteren</Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
