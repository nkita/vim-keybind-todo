import { Combobox, ComboboxOption, ComboboxOptions, ComboboxButton, ComboboxInput } from '@headlessui/react'
import React, { useState, forwardRef } from 'react'
import { ChevronsUpDown } from "lucide-react"
import { ControllerRenderProps } from 'react-hook-form'
import { Badge } from './badge'
import { ComboboxDynamicItemProps } from '@/types'

type SearchProps = {
    items: ComboboxDynamicItemProps[]
    autoFocus: any
    placeholder: string
    tabIndex?: number
    addItem: (value: ComboboxDynamicItemProps) => void
    onClose: () => void
}

interface SearchSelectProps
    extends ControllerRenderProps,
    SearchProps { }
const DynamicSearchSelect = forwardRef<HTMLInputElement, SearchSelectProps>(
    ({
        items,
        autoFocus,
        placeholder,
        tabIndex = 0,
        addItem,
        onChange,
        onBlur,
        onClose,
        ...props
    }, ref) => {
        const [val, setVal] = useState({})
        const [query, setQuery] = useState('')
        const filteredItems =
            query === ''
                ? [...items, { id: "", name: "" }]
                : [...items.filter((item) => {
                    return (
                        item.name.toLowerCase()
                            .replace(/\s+/g, '')
                            .includes(query.toLowerCase().replace(/\s+/g, ''))
                    )
                }), { id: "", name: "" }]

        const handleChange = (value: ComboboxDynamicItemProps) => {
            if (value !== undefined && value !== null) addItem(value)
            setVal(value)
        }

        return (
            <Combobox onChange={handleChange} value={val} immediate={true} >
                <div className="relative mt-1">
                    <div className="relative w-full">
                        <ComboboxInput
                            tabIndex={tabIndex}
                            displayValue={(item: ComboboxDynamicItemProps) => !item ? "" : item.name}
                            onChange={(event) => setQuery(event.target.value)} autoFocus={autoFocus} placeholder={placeholder}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
                        {/* className="placeholder:text-sm/tight" /> */}
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronsUpDown
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        </ComboboxButton>
                    </div>
                    <ComboboxOptions
                        className={`${filteredItems.length === 1 && !query && "hidden"} absolute p-3 border border-input my-2 max-h-60 w-full overflow-auto rounded-md text-popover-foreground bg-popover z-50 shadow-lg text-sm`}>
                        <>
                            {!filteredItems.map(f => f.name).includes(query) &&
                                <ComboboxOption value={{ id: "", name: query }} className={
                                    `relative cursor-default select-none py-2 pl-4 pr-4  w-full  data-[focus]:bg-accent data-[focus]:text-accent-foreground data-[focus]:cursor-pointer rounded-md`
                                }>
                                    <div className='flex gap-1 items-center justify-between'>
                                        <span className='font-bold truncate flex gap-1'>{query}</span><span className='text-xs text-muted-foreground'></span>
                                        <Badge variant={"outline"} className='bg-emerald-500 text-white' >new</Badge>
                                    </div>
                                </ComboboxOption>
                            }
                            {
                                filteredItems.map((item: ComboboxDynamicItemProps) => {
                                    return (
                                        <div key={item.id} className={`relative flex items-center`}>
                                            <ComboboxOption value={item} className={
                                                `relative cursor-default select-none py-2 pl-4 pr-4  w-full  data-[focus]:bg-accent data-[focus]:text-accent-foreground data-[focus]:cursor-pointer rounded-md`
                                            }>
                                                <div className='flex justify-between items-center'>
                                                    <div className={`flex justify-between align-middle font-bold items-center w-full ${item.name === "" && "text-red-500"}`}>
                                                        {item.name === "" ? "削除" : item.name}
                                                    </div>
                                                </div>
                                            </ComboboxOption>
                                        </div>
                                    )
                                })
                            }
                        </>
                    </ComboboxOptions>
                </div>
            </Combobox >
        )
    }
)

DynamicSearchSelect.displayName = "DynamicSearchSelect"
export { DynamicSearchSelect }