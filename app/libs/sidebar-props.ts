import { CardProps } from "./card-props";

export interface SidebarMenuProps {
    name: string,
    aimPoint: string,
    icon?: any,
    list: Array<CardProps>
}