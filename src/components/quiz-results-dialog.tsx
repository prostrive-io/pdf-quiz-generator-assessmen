"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export const QuizResultsDialog = ({score, isScoreDialogOpen, setIsScoreDialogOpen}: {score: number, isScoreDialogOpen: boolean, setIsScoreDialogOpen: (isOpen: boolean) => void}) =>{
  return (
    <Dialog open={isScoreDialogOpen} onOpenChange={setIsScoreDialogOpen}>
      <DialogContent className="flex flex-col items-center gap-4">
        <DialogHeader>
          <DialogTitle>
            Your Score
          </DialogTitle>
        </DialogHeader>
        <h2 className="text-2xl font-bold">{score.toString()}</h2>
      </DialogContent>
    </Dialog>
)
}