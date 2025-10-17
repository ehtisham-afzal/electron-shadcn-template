import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AddMultipleRowsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (count: number) => void
}

export function AddMultipleRowsDialog({
  open,
  onOpenChange,
  onConfirm,
}: AddMultipleRowsDialogProps) {
  const [count, setCount] = useState(5)

  const handleConfirm = () => {
    if (count > 0 && count <= 100) {
      onConfirm(count)
      onOpenChange(false)
      setCount(5)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Add Multiple Rows</DialogTitle>
          <DialogDescription>
            Enter the number of rows you want to add to the invoice.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='count'>Number of rows</Label>
            <Input
              id='count'
              type='number'
              min='1'
              max='100'
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              placeholder='Enter number of rows'
            />
            <p className='text-muted-foreground text-xs'>Maximum 100 rows at a time</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Add {count} Rows</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
