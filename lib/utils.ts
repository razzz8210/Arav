import { type TreeItem } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Convert a record of files to a tree structure.
 * @param files - Record of file paths to content
 * @return Tree structure for TreeView component
 * 
 * @example
 * Input: {"src/Button.tsx": "...", "README.md": "..."}
 * Output: [[ "src", "Button.tsx" ],  "README.md" ]]
  */


export function convertFilesToTreeItems(
  files: { [path : string]: string},
): TreeItem[] {
  interface TreeNode {
    [key: string]: TreeNode | null;
  }

  const tree: TreeNode = {};

  const sortedPaths = Object.keys(files).sort();

  for (const filePath of sortedPaths) {
    const parts = filePath.split("/");
    let current: TreeNode = tree;
  
  
    for (let i = 0; i < parts.length-1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    const fileName = parts[parts.length - 1];
    current[fileName] = null; 
  }

  function convertNode(node: TreeNode, name?: string): TreeItem[] | TreeItem{
    const enteries = Object.entries(node);
    if (enteries.length === 0) {
      return name || "";
    }
  
    const children: TreeItem[] = [];


    for  (const [key, value] of enteries) {
      if (value === null) {
        children.push(key);
      } else {
        const subTree = convertNode (value, key);
        if (Array.isArray(subTree)) {
          children.push([key, ...subTree]);
        } else {
          children.push([key, subTree]);
        }
      }
    }
    return children;
  }

  const  result = convertNode(tree);
  return Array.isArray(result) ? result : [result];}