import { Package } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">ShopDash</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with React, Tailwind CSS & shadcn/ui
          </p>
        </div>
      </div>
    </footer>
  )
}
