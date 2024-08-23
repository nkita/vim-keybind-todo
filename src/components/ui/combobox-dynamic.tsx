import { Combobox, ComboboxOption, ComboboxOptions, ComboboxButton, ComboboxInput } from '@headlessui/react'
import React, { useState, forwardRef } from 'react'
import { ChevronsUpDown } from "lucide-react"
import { ControllerRenderProps } from 'react-hook-form'
import { Badge } from './badge'
type SearchProps = {
    items: string[]
    autoFocus: any
    placeholder: string
    tabIndex?: number
    addItem: (label: string) => void
}

interface SearchSelectProps
    extends ControllerRenderProps,
    SearchProps { }
const DynamicSearchSelect = forwardRef<HTMLInputElement, SearchSelectProps>(
    ({
        items,
        value,
        autoFocus,
        placeholder,
        tabIndex = 0,
        addItem,
        onChange,
        onBlur,
        ...props
    }, ref) => {
        const [val, setVal] = useState(value)
        const [query, setQuery] = useState('')
        const filteredItems =
            query === ''
                ? [...items, ""]
                : [...items.filter((item: string) => {
                    return (
                        item.toLowerCase()
                            .replace(/\s+/g, '')
                            .includes(query.toLowerCase().replace(/\s+/g, ''))
                    )
                }), ""]
        const handleChange = (value: string) => {
            console.log("koko?", value)
            if (value !== undefined && value !== null) addItem(value)
            setVal(val)
        }
        return (
            <Combobox onChange={handleChange} value={val} immediate={true}>
                <div className="relative mt-1">
                    <div className="relative w-full">
                        <ComboboxInput
                            tabIndex={tabIndex}
                            displayValue={(item: string) => item}
                            onChange={(event) => setQuery(event.target.value)} autoFocus={autoFocus} placeholder={placeholder}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" /> 
                            {/* className="placeholder:text-sm/tight" /> */}
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronsUpDown
                                className="ml-2 shrink-0 opacity-500"
                                aria-hidden="true"
                            />
                        </ComboboxButton>
                    </div>
                    <ComboboxOptions
                        className={`${filteredItems.length === 1 && !query && "hidden"} absolute p-3 border border-input my-2 max-h-60 w-full overflow-auto rounded-md text-popover-foreground bg-popover z-50 shadow-lg text-sm`}>
                        <>
                            {
                                filteredItems.length <= 1 ? (
                                    <>
                                        <ComboboxOption value={query} className={
                                            `relative cursor-default select-none py-2 px-2 data-[focus]:cursor-pointer rounded-md`
                                        }>
                                            <div className='flex gap-1 items-center'>
                                                <Badge variant={"outline"} className='bg-emerald-500 text-white' >new</Badge>
                                                <span className='font-bold truncate flex gap-1'>{query}</span><span className='text-xs text-muted-foreground'></span>
                                            </div>
                                        </ComboboxOption>
                                    </>
                                ) : (
                                    filteredItems.map((item: any) => {
                                        return (
                                            <div key={item} className={`relative flex items-center`}>
                                                <ComboboxOption value={item} className={
                                                    `relative cursor-default select-none py-2 pl-4 pr-4  w-full  data-[focus]:bg-accent data-[focus]:text-accent-foreground data-[focus]:cursor-pointer rounded-md`
                                                }>
                                                    <div className='flex justify-between items-center'>
                                                        <div className={`flex justify-between align-middle font-bold items-center w-full ${item === "" && "text-red-500"}`}>
                                                            {item === "" ? "削除" : item}
                                                        </div>
                                                    </div>
                                                </ComboboxOption>
                                            </div>
                                        )
                                    })
                                )}
                        </>
                    </ComboboxOptions>
                </div>
            </Combobox >
        )
    }
)

DynamicSearchSelect.displayName = "DynamicSearchSelect"
export { DynamicSearchSelect }