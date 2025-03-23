
import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { gsap } from "gsap";

const NotFound = () => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    if (containerRef.current && textRef.current) {
      // Create animation for 404 page
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(textRef.current, {
        opacity: 0,
        scale: 1.2,
        duration: 0.5,
        delay: 0.3,
        ease: "back.out"
      });
    }
  }, [location.pathname]);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary p-6"
    >
      <div className="text-center glassmorphism rounded-xl p-8 max-w-md">
        <h1 
          ref={textRef}
          className="text-8xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent"
        >
          404
        </h1>
        <p className="text-xl text-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button 
          size="lg"
          className="gap-2"
          onClick={() => window.location.href = "/"}
        >
          <Home className="h-5 w-5" />
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
