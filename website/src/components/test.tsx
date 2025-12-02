import { TextField as MuiTextField } from '@mui/material'
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material'

interface TextFieldProps extends MuiTextFieldProps {
    label: string
}

const TextField = ({label}: TextFieldProps & TextFieldProps) => {
    
    return <MuiTextField {...props} />
  }
}
