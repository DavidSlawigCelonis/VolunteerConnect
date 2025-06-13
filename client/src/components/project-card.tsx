import { Project } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, MapPin, HandHeart, CheckCircle } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onApplyClick: (project: Project) => void;
}

const categoryColors = {
  environment: "bg-green-100 text-green-800",
  education: "bg-purple-100 text-purple-800", 
  community: "bg-blue-100 text-blue-800",
  healthcare: "bg-red-100 text-red-800",
  technology: "bg-indigo-100 text-indigo-800",
};

const categoryImages = {
  environment: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  education: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  community: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  healthcare: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  technology: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
};

export default function ProjectCard({ project, onApplyClick }: ProjectCardProps) {
  const categoryKey = project.category?.toLowerCase() as keyof typeof categoryColors;
  const categoryColorClass = categoryColors[categoryKey] || "bg-gray-100 text-gray-800";
  const categoryImage = categoryImages[categoryKey] || categoryImages.community;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 overflow-hidden group">
      <div className="h-48 relative">
        <img 
          src={categoryImage}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <Badge className={categoryColorClass}>
            {project.category}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-white/90 text-gray-700">
            <MapPin className="mr-1 h-3 w-3" />
            {project.location}
          </Badge>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {project.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
          {project.description}
        </p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="mr-1 h-4 w-4" />
            <span>{project.timeCommitment}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="mr-1 h-4 w-4" />
            <span>{project.duration}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge 
            variant={project.status === "Open" ? "default" : "secondary"}
            className={project.status === "Open" 
              ? "bg-green-100 text-green-800 hover:bg-green-100" 
              : "bg-orange-100 text-orange-800"
            }
          >
            <div className={`w-2 h-2 rounded-full mr-1.5 ${
              project.status === "Open" ? "bg-green-400" : "bg-orange-400"
            }`} />
            {project.status === "Open" ? "Open" : "Accepted"}
          </Badge>
          {project.status === "Open" ? (
            <Button 
              onClick={() => onApplyClick(project)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              size="sm"
            >
              <HandHeart className="mr-2 h-4 w-4" />
              Apply Now
            </Button>
          ) : (
            <Button disabled variant="secondary" size="sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              Position Filled
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
