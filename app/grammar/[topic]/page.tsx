"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, PenLine } from "lucide-react";

interface GrammarTopic {
  id: number;
  topicName: string;
  topicSlug: string;
  description: string | null;
  difficultyOrder: number;
  contentMarkdown: string;
  _count: { exercises: number };
}

export default function GrammarTopicPage() {
  const params = useParams();
  const slug = params.topic as string;
  const [topic, setTopic] = useState<GrammarTopic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/grammar/topics/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setTopic(data.topic || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Topic Not Found</h1>
        <Link href="/grammar">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Grammar
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/grammar">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{topic.topicName}</h1>
          {topic.description && (
            <p className="text-muted-foreground mt-1">{topic.description}</p>
          )}
        </div>
      </div>

      {/* Lesson Content */}
      <Card>
        <CardContent className="pt-6 prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {topic.contentMarkdown}
          </ReactMarkdown>
        </CardContent>
      </Card>

      {/* Practice Button */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary">
          {topic._count.exercises} exercises available
        </Badge>
        <Link href={`/grammar/exercises?topicId=${topic.id}&topicSlug=${topic.topicSlug}`}>
          <Button>
            <PenLine className="mr-2 h-4 w-4" />
            Practice Exercises
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
