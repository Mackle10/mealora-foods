import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Partners from "./pages/Partners";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import CourierDashboard from "./pages/CourierDashboard";
import ReviewOperations from "./pages/ReviewOperations";
import OwnerDashboard from "./pages/OwnerDashboard";

export default function App() {
  return <ErrorBoundary><TooltipProvider><Toaster position="bottom-right" /><Switch><Route path="/" component={Home} /><Route path="/auth" component={Auth} /><Route path="/profile" component={Profile} /><Route path="/partners" component={Partners} /><Route path="/courier" component={CourierDashboard} /><Route path="/reviews" component={ReviewOperations} /><Route path="/owner" component={OwnerDashboard} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></TooltipProvider></ErrorBoundary>;
}
